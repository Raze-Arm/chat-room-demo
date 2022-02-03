package raze.spring.webrtc.utility;

import java.util.HashSet;


public class FixedHashSet<T> extends HashSet<T> {

    private final long maxSize;


    public FixedHashSet(long maxSize) {
        this.maxSize = maxSize;
    }


    @Override
    public boolean add(T t) {
        if(size() == maxSize) {
            super.remove(0);
        }
        return super.add(t);
    }

    public long getMaxSize() {
        return maxSize;
    }
}
