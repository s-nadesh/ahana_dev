<?php

namespace common\models\behaviors;

use Yii;
use yii\base\Event;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

/**
 * SoftDelete
 * Usage:
 *
 * ~~~
 * public function behaviors() {
 *     return [
 *         'softDelete' => ['class' => 'amnah\yii2\behaviors\SoftDelete',
 *             'attribute' => 'delete_time',
 *             'timestamp' => time(),
 *             'safeMode' => true,
 *         ],
 *     ];
 * }
 * ~~~
 * @author amnah <amnah.dev@gmail.com>
 */
class SoftDelete extends TimestampBehavior {

    /**
     * @var string SoftDelete attribute
     */
    public $attribute = "delete_time";
    public $updatedByAttribute = 'updated_by';

    /**
     * @var bool If true, this behavior will process '$model->delete()' as a soft-delete. Thus, the
     *           only way to truly delete a record is to call '$model->forceDelete()'
     */
    public $safeMode = true;

    /**
     * @inheritdoc
     */
    public function events() {
        return [ActiveRecord::EVENT_BEFORE_DELETE => 'doDeleteTimestamp'];
    }

    /**
     * Set the attribute with the current timestamp to mark as deleted
     *
     * @param Event $event
     */
    public function doDeleteTimestamp($event) {
        // do nothing if safeMode is disabled. this will result in a normal deletion
        if (!$this->safeMode) {
            return;
        }
        // remove and mark as invalid to prevent real deletion
        $this->remove();
        $event->isValid = false;
    }

    /**
     * Remove (aka soft-delete) record
     */
    public function remove() {
        // evaluate timestamp and set attribute
//        $timestamp = $this->getValue(null);

        $attribute = $this->attribute;

//        $updatebyAttribute = $this->updatedByAttribute;
        $user = Yii::$app->get('user', false);
        $user_id = $user && !$user->isGuest ? $user->id : null;

//        $this->owner->$updatebyAttribute = $user_id;
        $this->owner->touch($attribute);
        
        $this->owner->updateAttributes([$this->updatedByAttribute => $user_id]);
        // save record
//        $this->owner->save(false, [$attribute]);
    }

    /**
     * Restore soft-deleted record
     */
    public function restore() {
        // mark attribute as null
        $attribute = $this->attribute;
        $this->owner->$attribute = null;
        // save record
        $this->owner->save(false, [$attribute]);
    }

    /**
     * Delete record from database regardless of the $safeMode attribute
     */
    public function forceDelete() {
        // store model so that we can detach the behavior and delete as normal
        $model = $this->owner;
        $this->detach();
        $model->delete();
    }

}
